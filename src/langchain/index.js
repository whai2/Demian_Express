// 전처리
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// 벡터 db (내부: 전처리 - 임베딩)
import { vectorStore } from "./vectorDBAndEmbeddings.js";

// 모델 - 프롬프트
import { llm, prompt } from "./llmModelAndPrompt.js";

// retrieval chain: rag chain
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";


export class RagChatBot {
  constructor() {
    
  }
}

const loader = new PDFLoader("./nke-10k-2023.pdf", {
  // splitPages: false,
});
const docs = await loader.load();
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const splits = await textSplitter.splitDocuments(docs);

const retriever = vectorStore.asRetriever();

const questionAnswerChain = await createStuffDocumentsChain({ llm, prompt });
const ragChain = await createRetrievalChain({
  retriever,
  combineDocsChain: questionAnswerChain,
});

const results = await ragChain.invoke({
  input: "What was Nike's revenue in 2023?",
});

