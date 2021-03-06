import { Socket } from "phoenix";

let socket = new Socket("/socket", { params: { token: window.userToken } });

socket.connect();

const createSocket = topicId => {
  let channel = socket.channel(`comments:${topicId}`, {});
  channel
    .join()
    .receive("ok", ({ comments }) => {
      renderComments(comments);
    })
    .receive("error", resp => {
      console.log("Unable to join", resp);
    });

  channel.on(`comments:${topicId}:new`, renderComment);

  document.querySelector("button").addEventListener("click", () => {
    const content = document.querySelector("textarea").value;

    channel.push("comment:add", { content });
  });
};

function commentTemplate({ content, user }) {
  let email = (user && user.email) || "Anonymous";
  return `
  <li class="collection-item">
    ${content}
    <div class="secondary-content">
      ${email}
    </div>
  </li>`;
}

function renderComment({ comment }) {
  const renderedComment = commentTemplate(comment);

  document.querySelector(".collection").innerHTML += renderedComment;
}

function renderComments(comments = []) {
  const renderedComments = comments.map(comment => {
    return commentTemplate(comment);
  });

  document.querySelector(".collection").innerHTML = renderedComments.join("");
}

window.createSocket = createSocket;
