"use client";

import "./firebase";
import {
  getFirestore,
  DocumentData,
  getDoc,
  DocumentReference,
  doc,
} from "firebase/firestore";
import { MOR_ID, OREL_ID } from "../../constants";
import { useState } from "react";
import { BookInfo, convertBooksToCSVAndDownload } from "../../csvUtils";

export default function Home() {
  const [isFetching, setIsFetching] = useState(false);

  async function getUserCollectionData(userId: string) {
    if (isFetching) return;

    setIsFetching(true);
    const db = getFirestore(); // Initialize Firestore
    const userRef: DocumentReference<DocumentData> = doc(db, "users", userId);

    try {
      const docSnap = await getDoc(userRef);
      

      if (!docSnap.exists()) {
        console.log("No such document!");
        return;
      }
      // Extract data from the documents
      const data = docSnap.data();
      
      const collection: BookInfo[] = data.collection.map(
        (book: any) => book.book as BookInfo
      );
      const favoriteBooks: BookInfo[] = data.favoriteBooks.map(
        (book: any) => book.book as BookInfo
      );
      console.log(
        "favoriteBooks:",
        favoriteBooks.map((book) => book.title)
      );
      const readingList: BookInfo[] = data.readingList.map(
        (book: any) => book.book as BookInfo
      );
      
      convertBooksToCSVAndDownload(collection, readingList, favoriteBooks);
      return data;
    } catch (error) {
      console.error("Error getting user collection data:", error);
      throw error;
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div
        className="text-4xl font-bold cursor-pointer bg-blue-300 rounded-full p-4"
        onClick={() => {
          const userId = OREL_ID;

          getUserCollectionData(userId)
            .then((data) => {
              console.log("User collection data:", data);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        }}
      >
        Orel
      </div>
      <div
        className="text-4xl font-bold cursor-pointer bg-blue-300 rounded-full p-4"
        onClick={() => {
          const userId = MOR_ID;

          getUserCollectionData(userId)
            .then((data) => {
              console.log("User collection data:", data);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        }}
      >
        Mor
      </div>
    </div>
  );
}
