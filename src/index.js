import api, { route } from "@forge/api";

export function messageLogger(payload){
  console.log(`Logging message: ${payload.message}`);
}

export async function getCommentsOnIssue(payload){
  const response = await api.asUser().requestJira(route`/rest/api/3/issue/${payload.issueKey}/comment`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
  console.log(await response.json());
  let data = response.data

  const customerComments = data.comments
    .filter(comment => comment.author.accountType === "customer")
    .map(comment => {
        const updatedTime = comment.updated;
        const commentText = comment.body.content
            .flatMap(paragraph => paragraph.content)
            .filter(content => content.type === "text")
            .map(textContent => textContent.text) 
            .join(""); 
        return { updated: updatedTime, text: commentText };
    });
  console.log(customerComments);
  return customerComments;
}

export async function updateSentiment(payload){
  let data = JSON.stringify({
    "fields": {
      "customfield_10054": `${payload.sentiment}`
    }
  });

  const response = await api.asUser().requestJira(route`/rest/api/3/issue/${payload.issueKey}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PUT',
    body: data
  });
  
  console.log(`Response: ${response.status} ${response.statusText}`);
  console.log(await response.json());
}