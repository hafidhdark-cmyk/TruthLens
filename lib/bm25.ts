import { CorpusPassage } from "@/types";

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
  "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for",
  "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
  "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is",
  "isn't", "it", "it's", "its", "itself", "me", "more", "most", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so",
  "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
  "then", "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "wasn't", "we", "were", "what", "when",
  "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your",
]);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (term) => term.length > 2 && !STOP_WORDS.has(term)
  );
}

export class BM25Retriever {
  private passages: CorpusPassage[];
  private docTokens: string[][];
  private docLengths: number[];
  private avgDocLength: number;
  private df: Map<string, number>;
  private totalDocs: number;
  private k1: number;
  private b: number;

  constructor(passages: CorpusPassage[], k1 = 1.5, b = 0.75) {
    this.passages = passages;
    this.k1 = k1;
    this.b = b;
    this.totalDocs = passages.length;
    this.df = new Map();
    this.docTokens = [];
    this.docLengths = [];

    let totalLength = 0;

    for (const doc of passages) {
      // Index both text and source title
      const fullText = `${doc.source_title} ${doc.text}`;
      const tokens = tokenize(fullText);
      this.docTokens.push(tokens);
      this.docLengths.push(tokens.length);
      totalLength += tokens.length;

      const uniqueTerms = new Set(tokens);
      for (const term of uniqueTerms) {
        this.df.set(term, (this.df.get(term) || 0) + 1);
      }
    }

    this.avgDocLength = this.totalDocs > 0 ? totalLength / this.totalDocs : 0;
  }

  private getIdf(term: string): number {
    const docFreq = this.df.get(term) || 0;
    if (docFreq === 0) return 0;
    // Standard Lucene / BM25 IDF formulation
    return Math.log(1 + (this.totalDocs - docFreq + 0.5) / (docFreq + 0.5));
  }

  public search(query: string, topK: number = 4): CorpusPassage[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || this.totalDocs === 0) {
      return [];
    }

    const scores: { index: number; score: number }[] = [];

    for (let i = 0; i < this.totalDocs; i++) {
      const docTokens = this.docTokens[i];
      const docLen = this.docLengths[i];
      const tfMap = new Map<string, number>();

      for (const t of docTokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }

      let score = 0;
      for (const qTerm of queryTokens) {
        const tf = tfMap.get(qTerm) || 0;
        if (tf === 0) continue;

        const idf = this.getIdf(qTerm);
        const numerator = tf * (this.k1 + 1);
        const denominator =
          tf + this.k1 * (1 - this.b + this.b * (docLen / (this.avgDocLength || 1)));

        score += idf * (numerator / denominator);
      }

      // Bonus for exact multi-word / partial matches
      const queryLower = query.toLowerCase();
      const docLower = `${this.passages[i].source_title} ${this.passages[i].text}`.toLowerCase();
      if (docLower.includes(queryLower.slice(0, 20))) {
        score += 1.5;
      }

      scores.push({ index: i, score });
    }

    scores.sort((a, b) => b.score - a.score);

    // Only return topK with positive score
    return scores
      .slice(0, topK)
      .map((item) => ({
        ...this.passages[item.index],
        score: Math.round(item.score * 100) / 100,
      }));
  }
}
