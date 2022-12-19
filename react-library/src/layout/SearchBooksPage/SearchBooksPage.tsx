import { useEffect, useState } from "react";
import BookModel from "../../models/BookModel";
import { Pagination } from "../Utils/Pagination";
import { SpinnerLoading } from "../Utils/SpinnerLoading";
import { SearchBook } from "./components/SearchBook";

export const SearchBooksPage = () => {
  const [books, setBooks] = useState<BookModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [httpError, setHttpError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookPerPage] = useState(5);
  const [totalAmountofBooks, setTotalAmountofBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [categorySelection, setCategorySelection] = useState("Book category");

  useEffect(() => {
    const feetchBooks = async () => {
      const baseUrl: string = "http://localhost:8080/api/books";

      let url: string = `${baseUrl}?page=${
        currentPage - 1
      }&size=${bookPerPage}`;

      if (searchUrl === "") {
        url = `${baseUrl}?page=${currentPage - 1}&size=${bookPerPage}`;
      } else {
        url = baseUrl + searchUrl;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Some thing wrong!!");
      }

      const responseJson = await response.json();

      const responseData = responseJson._embedded.books;

      setTotalAmountofBooks(responseJson.page.totalElements);
      setTotalPages(responseJson.page.totalPages);

      const loadedBooks: BookModel[] = [];

      for (const key in responseData) {
        loadedBooks.push({
          id: responseData[key].id,
          title: responseData[key].title,
          author: responseData[key].author,
          description: responseData[key].description,
          copies: responseData[key].copies,
          copiesAvailable: responseData[key].copiesAvailable,
          category: responseData[key].category,
          img: responseData[key].img,
        });
      }

      setBooks(loadedBooks);
      setIsLoading(false);
    };
    feetchBooks().catch((error: any) => {
      setIsLoading(true);
      setHttpError(error.message);
    });
    window.scrollTo(0, 0);
  }, [currentPage, searchUrl]);

  if (isLoading) {
    return <SpinnerLoading />;
  }

  if (httpError) {
    return (
      <div className="container md-5">
        <p>{httpError}</p>
      </div>
    );
  }
  const searchHandleChange = () => {
    if (search === "") {
      setSearchUrl("");
    } else {
      setSearchUrl(
        `/search/findByTitleContaining?title=${search}&page=0&size=${bookPerPage}`
      );
    }
  };

  const cateogryField = (value: string) => {
    if (
      value.toLowerCase() === "fe" ||
      value.toLowerCase() === "be" ||
      value.toLowerCase() === "data" ||
      value.toLowerCase() === "devops"
    ) {
      setCategorySelection(value);
      setSearchUrl(
        `/search/findByCategory?category=${value}&page=0&size=${bookPerPage}`
      );
    } else {
      setCategorySelection("All");
      setSearchUrl(`?page=0&size=${bookPerPage}`);
    }
  };

  const indexOfLastBook: number = currentPage * bookPerPage;
  const indexOfFirstBook: number = indexOfLastBook - bookPerPage;
  let lastItem =
    bookPerPage * currentPage <= totalAmountofBooks
      ? bookPerPage * currentPage
      : totalAmountofBooks;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  return (
    <div>
      <div className="container">
        <div className="row mt-5">
          <div className="col-6 ">
            <div className="d-flex">
              <input
                type="search"
                placeholder="Search"
                className="form-control me-2"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-outline-success"
                onClick={() => searchHandleChange()}
              >
                Search
              </button>
            </div>
          </div>
          <div className="col-4">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {categorySelection}
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton1"
              >
                <li onClick={() => cateogryField("All")}>
                  <a className="dropdown-item" href="#">
                    All
                  </a>
                </li>
                <li onClick={() => cateogryField("FE")}>
                  <a className="dropdown-item" href="#">
                    Front End
                  </a>
                </li>
                <li onClick={() => cateogryField("BE")}>
                  <a className="dropdown-item" href="#">
                    Back End
                  </a>
                </li>
                <li onClick={() => cateogryField("Data")}>
                  <a className="dropdown-item" href="#">
                    Data
                  </a>
                </li>
                <li onClick={() => cateogryField("DevOps")}>
                  <a className="dropdown-item" href="#">
                    DevOps
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {totalAmountofBooks > 0 ? (
            <>
              <div className="mt-3">
                <h5>Number of result: ({totalAmountofBooks})</h5>
              </div>
              <p>
                {indexOfFirstBook + 1} to {lastItem} of {totalAmountofBooks}
                items:
              </p>

              {books.map((book) => (
                <SearchBook book={book} key={book.id} />
              ))}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={paginate}
                />
              )}
            </>
          ) : (
            <div className="m-5">
              <h3>Can't find what you are looking for?</h3>
              <a
                className="btn main-color btn-md px-4 me-md-2 fw-bold text-white"
                type="button"
                href="#"
              >
                Library Service
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};