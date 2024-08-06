import cache from "./preprocessCache.js";

// 전처리
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// 모델 - 프롬프트
import { llm, prompt } from "./llmModelAndPrompt.js";

// retrieval chain: rag chain
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

// 벡터 db - 임베딩
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

export class RagChat {
  constructor(fileUrl) {
    this.fileUrl = fileUrl;
    this.vectorStore = null;
    this.init();
  }

  async init() {
    await this.#preprocessPDF();
  }

  async #preprocessPDF() {
    if (cache.has(this.fileUrl)) {
      this.vectorStore = cache.get(this.fileUrl);
      return cache.get(this.fileUrl);
    }

    // Fetch the file as a blob
    const response = await fetch(this.fileUrl);
    const blob = await response.blob();

    // Convert blob to a File object if necessary
    const file = new File([blob], "document.pdf", { type: blob.type });
    
    const loader = new PDFLoader(file, {
      // splitPages: false,
    });

    const docs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splits = await textSplitter.splitDocuments(docs);

    // vector db save
    this.vectorStore = await MemoryVectorStore.fromDocuments(
      splits,
      new OpenAIEmbeddings()
    );
    
    cache.set(this.fileUrl, this.vectorStore);
  }

  async ragAnswer(message) {
    if (!this.vectorStore) {
      // Ensure vectorStore is initialized
      await this.init();
    }
    
    const retriever = this.vectorStore.asRetriever();

    const questionAnswerChain = await createStuffDocumentsChain({
      llm,
      prompt,
    });

    const ragChain = await createRetrievalChain({
      retriever,
      combineDocsChain: questionAnswerChain,
    });

    return await ragChain.invoke({
      input: message,
    });
  }
}
