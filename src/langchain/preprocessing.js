// 파싱 - 텍스트 나누기 : do not use cost
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const loader = new PDFLoader("./nke-10k-2023.pdf", {
  // splitPages: false,
});

const docs = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export const splits = await textSplitter.splitDocuments(docs);