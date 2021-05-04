const progressDivElement = document.getElementById("progressDiv");
const progressElement = document.getElementById("progress");
const percentageProgress = document.getElementById("percentageProgress");

//// DOM Event Handlers
let button = document.getElementById("button");
button.addEventListener("click", async (e) => {
  await getTheFile();
});

async function getTheFile() {
  const [fileHandle] = await window.showOpenFilePicker();
  const fileData = await fileHandle.getFile();
  sendFile(fileData);
}

function sendFile(selectedFile) {
  var file = selectedFile;
  var stream = ss.createStream();
  var socket = io.connect("/filetransfer");
  const blobStream = ss.createBlobReadStream(file);

  ////Socket Event Handlers
  socket.on("connect", () => console.log("socket connected"));
  socket.on("tranfer complete", (data) => {
    console.log("tranfer complete", data);
    blobStream.unpipe(stream);
    blobStream.destroy();
    stream.destroy();
  });

  ////BlobStream Event Handlers
  let size = 0;
  let percentage = 0;
  blobStream.on("data", function (chunk) {
    size += chunk.length;
    percentage = Math.ceil((size / file.size) * 100);
    progressElement.value = percentage;
    percentageProgress.innerHTML = percentage + "%";
  });
  blobStream.on("end", function () {
    progressDivElement.style.display = "none";
  });

  //// upload a file to the server.
  progressDivElement.style.display = "block";
  ss(socket).emit("fileData", stream, { size: file.size, name: file.name });
  blobStream.pipe(stream);
}
