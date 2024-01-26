import logo from "./logo.svg";
import "./App.css";
import React from "react";
import axios from "axios";
const { ipcRenderer } = window.require("electron");

/**
 * = 비드파일확인 프로그램
 *  1. 내 PC에 있는 비드파일을 전부 보여준다
 *  [공고명 검색 OR 공고번호 검색]
 *
 *  [정렬 우선순위]
 *  - 다운로드 순서
 *  - 투찰마감 순서
 *  - 공고별로 분류
 *
 *  [화면에 표시되는 컬럼]
 *  - 공고명 [공고번호]
 *  - 사업자번호
 *  - 투찰금액
 *  - 입찰일
 *  - 투찰마감일
 *  - 다운로드 일자
 *  - 투찰완료클릭
 *  - 공고상세 링크
 *
 *
 *
 * @returns
 */
function App() {
  const [loading, setLoading] = React.useState(true);
  const [bidFiles, setBidFiles] = React.useState([]);

  React.useEffect(() => {
    const handleBidFile = (event, bidFIles) => {
      setBidFiles(bidFIles);
      setLoading(false);
    };

    ipcRenderer.on("GET_BID_FILE", handleBidFile);

    return () => {
      ipcRenderer.removeListener("GET_BID_FILE", handleBidFile);
    };

    // 컴포넌트가 처음 마운트될 때 한 번만 실행되도록 빈 배열을 두 번째 인자로 전달
  }, []);

  React.useEffect(() => {
    // 이 부분에서 필요한 로직을 수행
    (async () => {
      await new Promise((resolve, reject) => {
        ipcRenderer.send("GET_BID_FILE", "send");
        resolve();
      });

      console.log("hello");
    })();
  }, []);

  console.log(bidFiles);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn
          {loading ? "Loading..." : "End"}
        </a>
      </header>
    </div>
  );
}

export default App;
