const delimiter = ";";

const titleMap: {
  id: string;
  title: string;
}[] = [
  { id: "title", title: "Title" },
  { id: "authors", title: "Authors" },
  { id: "authorLF", title: "Author l-f" },
  { id: "additionalAuthors", title: "Additional Authors" },
  { id: "isbn", title: "ISBN" },
  { id: "isbn13", title: "ISBN13" },
  { id: "myRating", title: "My Rating" },
  { id: "publisher", title: "Publisher" },
  { id: "binding", title: "Binding" },
  { id: "pageCount", title: "Number of Pages" },
  { id: "yearPublished", title: "Year Published" },
  { id: "originalPublicationYear", title: "Original Publication Year" },
  { id: "dateRead", title: "Date Read" },
  { id: "dateAdded", title: "Date Added" },
  { id: "bookshelves", title: "Bookshelves" },
  { id: "bookshelvesWithPositions", title: "Bookshelves with positions" },
  { id: "exclusiveShelf", title: "Exclusive Shelf" },
  { id: "spoiler", title: "Spoiler" },
  { id: "privateNotes", title: "Private Notes" },
  { id: "readCount", title: "Read Count" },
  { id: "ownedCopies", title: "Owned Copies" },
  { id: "favorite", title: "Favorite" },
];

export class BookInfo {
  title: string;
  authors: string[];
  publisher: string;
  pageCount: number;
  publishedDate: string;
  industryIdentifiers: { type: string; identifier: string }[];
  averageRating: number;

  constructor(
    title: string,
    authors: string[],
    publisher: string,
    pageCount: number,
    publishedDate: string,
    industryIdentifiers: { type: string; identifier: string }[],
    averageRating: number
  ) {
    this.title = title;
    this.authors = authors;
    this.publisher = publisher;
    this.pageCount = pageCount;
    this.publishedDate = publishedDate;
    this.industryIdentifiers = industryIdentifiers;
    this.averageRating = averageRating;
  }
  [key: string]:
    | string
    | number
    | string[]
    | { type: string; identifier: string }[];
}

export function convertBooksToCSVAndDownload(
  readList: BookInfo[],
  toReadList: BookInfo[],
  favoriteList: BookInfo[]
) {
  // CSV headers
  const headers = titleMap.map((title) => title.title).join(delimiter);

  const rows = [headers];

  // Function to format a book into a CSV row
  const formatBookForCSV = (
    book: BookInfo,
    isFavorite: boolean,
    readList: boolean
  ) => {
    let currentRow = "";

    for (let i = 0; i < titleMap.length; i++) {
      const id = titleMap[i].id;
      const title = titleMap[i].title;
      let item: any = "";
      if (title === "Favorite") {
        item = isFavorite ? "Yes" : "No";
      } else if (title === "ISBN") {
        item =
          book?.industryIdentifiers?.length > 0
            ? book.industryIdentifiers[0].identifier
            : "";
      } else if (title === "ISBN13") {
        item =
          book?.industryIdentifiers?.length > 1
            ? book.industryIdentifiers[1].identifier
            : "";
      } else if (title === "Authors") {
        item = book.authors?.join(", ") || "";
      } else if (title === "Exclusive Shelf") {
        item = readList ? "read" : "to-read";
      } else if (book[id]) {
        item = book[id];
      }
      try {
        // if (item && item.includes(",")) {
        //   item = '"' + item + '"';
        // }
      } catch (e) {
        console.log("Error with item: ", item);
      }
      currentRow += item;
      if (i < titleMap.length - 1) {
        currentRow += delimiter;
      }
    }
    return currentRow;
  };
  favoriteList.forEach((book) => {
    const readBook = readList.find((readBook) => readBook.title === book.title);
    const toReadBook = toReadList.find(
      (toReadBook) => toReadBook.title === book.title
    );
    if (readBook) {
      readList = readList.filter((readBook) => readBook.title !== book.title);
    }
    if (toReadBook) {
      toReadList = toReadList.filter(
        (toReadBook) => toReadBook.title !== book.title
      );
    }
  });
  readList.forEach((book) => rows.push(formatBookForCSV(book, false, true)));
  toReadList.forEach((book) => rows.push(formatBookForCSV(book, false, false)));
  favoriteList.forEach((book) => rows.push(formatBookForCSV(book, true, true)));

  const csvContent = rows.join("\n");
  download(csvContent, "books-data.csv");
}

function download(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
