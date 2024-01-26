const { app, BrowserWindow, ipcMain } = require("electron");

const fs = require("fs").promises;
const AdmZip = require("adm-zip");
const path = require("path");

// ! isDev [commonjs module 사용으로 인한 오류]
// const isDev = require("electron-is-dev");

const isDev = true;

let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 640,
    webPreferences: {
      nodeIntegration: true,
      devTools: isDev,
      // * TypeError: window.require is not a function 일때 추가
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  // mainWindow.setResizable(false);
  mainWindow.setResizable(true);
  mainWindow.on("closed", () => (mainWindow = null));
  mainWindow.focus();
};

// electron이 초기화 끝났을 때
app.on("ready", async () => {
  createWindow();
});

// 모든 window가 종료되었을 때
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// app이 활성화 되었을 때
app.on("activate", () => {
  if (!mainWindow) {
    createWindow();
  }

  console.log("activate");
});

const directoriesToSearch = ["C:\\", "D:\\"];
const saveDir = "C:/Bridge Kevin";

ipcMain.on("GET_BID_FILE", async (event, arg) => {
  console.log(
    `============================== Start ==============================`
  );

  /**
   * Electron 메인 프로세스에서 시간이 오래걸리는 작업을 수행할떄는
   * 렌더러 프로세스(화면)를 차단하지않도록 비동기적으로 처리!!
   */
  const [bidFiles1, bidFiles2] = await Promise.all(
    directoriesToSearch.map(async (directory) => {
      return await walkDir(directory);
    })
  );

  const bidFiles = [...bidFiles1, ...bidFiles2];

  console.log(bidFiles);

  if (!empty(bidFiles1)) {
    for (const { file, filePath } of bidFiles) {
      const filePathArray = filePath.split("\\");
      const fileName = filePathArray.pop();
      const lowerFileName = fileName.toLowerCase();
      const netFileName = lowerFileName.replace(".bid", "");
      const privateDir = path.join(saveDir, netFileName);

      try {
        await fs.mkdir(saveDir, { recursive: true });

        await fs.mkdir(privateDir, { recursive: true });

        const zipFileName = lowerFileName.replace(".bid", ".zip");
        const newZipFilePath = path.join(privateDir, zipFileName);

        await fs.copyFile(filePath, newZipFilePath);

        await fs.chmod(newZipFilePath, 0o777);

        const zip = new AdmZip(newZipFilePath);
        zip.extractAllTo(privateDir, true);

        const printrFilePath = `${privateDir}\\${netFileName}.BID`;
        const bidCode = await fs.readFile(printrFilePath, "utf8");
        const decodedData = Buffer.from(bidCode, "base64").toString("utf-8");
        const jsonData = JSON.parse(decodedData);

        const num = jsonData["T1"]["C5"] || "";
        const companyNum = jsonData["T1"]["C17"] || "";
        const companyName = jsonData["T1"]["C18"] || "";

        const confirmMsg = [
          `공고번호 : ${num}`,
          `사업자번호 : ${companyNum}`,
          `사업자명 : ${companyName}`,
        ];

        console.log(confirmMsg);
      } catch (err) {}
    }
  }

  console.log(
    `============================== End ==============================`
  );

  mainWindow.webContents.send("GET_BID_FILE", { bidFiles1, bidFiles2 });
});

// 재귀적으로 디렉토리 탐색하는 함수
async function walkDir(dir) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });

    const bidFiles = [];

    for (const { name: file } of files) {
      if (ignoreFolders(file)) {
        try {
          const filePath = path.join(dir, file);
          const stat = await fs.stat(filePath);

          if (stat.isDirectory()) {
            // 디렉토리인 경우 재귀적으로 탐색
            await walkDir(filePath);
          } else {
            if (file.endsWith(".BID") || file.endsWith(".bid")) {
              // 파일인 경우 배열에 추가
              bidFiles.push({
                file,
                filePath,
              });
            }
          }
        } catch (e) {
          // 오류 발생 시 처리
          // console.error(e);
        }
      }
    }

    return bidFiles;
  } catch (e) {
    // 오류 발생 시 처리
    // console.error(`Error reading directory ${e.message}`);
    return [];
  }
}

function ignoreFolders(file) {
  let isContinue = true;

  if (file.includes("MSOCache")) {
    isContinue = false;
  }

  if (file.includes("Recovery")) {
    isContinue = false;
  }

  if (file.includes("System")) {
    isContinue = false;
  }

  if (file.includes("node_modules")) {
    isContinue = false;
  }

  if (file.includes("svn")) {
    isContinue = false;
  }

  if (file.includes("git")) {
    isContinue = false;
  }

  if (file.includes("php")) {
    isContinue = false;
  }

  if (file.includes("svg")) {
    isContinue = false;
  }

  if (file.includes("Program Files")) {
    isContinue = false;
  }

  if (file.includes("PerfLogs")) {
    isContinue = false;
  }

  if (file.includes("ProgramData")) {
    isContinue = false;
  }

  if (file.includes("Windows")) {
    isContinue = false;
  }

  if (file.includes("$")) {
    isContinue = false;
  }

  if (file.includes(".log")) {
    isContinue = false;
  }

  if (file.includes(".sys")) {
    isContinue = false;
  }

  if (file.includes("OneDrive")) {
    isContinue = false;
  }
  if (file.includes("workSpace")) {
    isContinue = false;
  }

  if (file.includes("AppData")) {
    isContinue = false;
  }

  if (file.includes(".metadata")) {
    isContinue = false;
  }

  if (file.includes(".php")) {
    isContinue = false;
  }
  if (file.includes(".css")) {
    isContinue = false;
  }
  if (file.includes(".js")) {
    isContinue = false;
  }

  if (file.includes("gradle")) {
    isContinue = false;
  }
  if (file.includes("space")) {
    isContinue = false;
  }

  return isContinue;
}

function empty(value) {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string" && value.trim() === "") {
    return true;
  }

  if (typeof value === "number" && value === 0) {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (typeof value === "object" && Object.keys(value).length === 0) {
    return true;
  }

  return false;
}
