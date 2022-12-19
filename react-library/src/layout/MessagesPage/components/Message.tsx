import React, { useEffect, useState } from "react";
import { useOktaAuth } from "@okta/okta-react";
import MessageModel from "../../../models/MessageModel";
import { SpinnerLoading } from "../../Utils/SpinnerLoading";
import { Pagination } from "../../Utils/Pagination";

export const Message = () => {
  const { authState } = useOktaAuth();
  const [isLoadingMessage, setIsLoadingMessage] = useState(true);
  const [httpError, setHttpError] = useState("");

  // Message
  const [messages, setMessages] = useState<MessageModel[]>([]);

  // Pagiantion
  const [messagePerPage] = useState(5);
  const [currentPerPage, setCurrentPerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchUserMessage = async () => {
      if (authState && authState?.isAuthenticated) {
        const url = `http://localhost:8080/api/messages/search/findByUserEmail/?userEmail=${
          authState?.accessToken?.claims.sub
        }&page=${currentPerPage - 1}&size=${messagePerPage}`;
        const requestOptions = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authState?.accessToken?.accessToken}`,
            "Content-Type": "application/json",
          },
        };
        const messageResponse = await fetch(url, requestOptions);
        if (!messageResponse.ok) {
          throw new Error("Some thing went wrong");
        }
        const messageResponseJson = await messageResponse.json();
        setMessages(messageResponseJson._embedded.messages);
        setTotalPages(messageResponseJson.page.totalPages);
      }
      setIsLoadingMessage(false);
    };
    fetchUserMessage().catch((error: any) => {
      setIsLoadingMessage(false);
      setHttpError(error.message);
    });
    window.scrollTo(0, 0);
  }, [authState, currentPerPage]);

  if (isLoadingMessage) {
    return <SpinnerLoading />;
  }
  if (httpError) {
    return (
      <div className="container mt-5">
        <p>{httpError}</p>
      </div>
    );
  }

  const paginate = (pageNumber: number) => {
    setCurrentPerPage(pageNumber);
  };

  return (
    <div className="mt-2">
      {messages.length > 0 ? (
        <>
          <h5>Current Q/A: </h5>
          {messages.map((message) => (
            <div key={message.id}>
              <div className="card mt-2 shadow p-3 bg-body rounded">
                <h5>
                  Case #{message.id}: {message.title}
                </h5>
                <h6>{message.userEmail}</h6>
                <p>{message.question}</p>
                <hr />
                <div>
                  <h5>Response: </h5>
                  {message.response && message.adminEmail ? (
                    <>
                      <h6>{message.adminEmail} (admin)</h6>
                      <p>{message.response}</p>
                    </>
                  ) : (
                    <>
                      <i>
                        Pending response from administration. Please be patient.
                      </i>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          <h5>All question you submit will be show here</h5>
        </>
      )}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPerPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}
    </div>
  );
};
