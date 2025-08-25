async function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (chrome.runtime.lastError || !token) {
                reject(chrome.runtime.lastError);
            } else {
                // console.log("Got token:", token);
                resolve(token);
            }
        });
    });
}

async function fetchEmails() {
    try {
        const token = await getAuthToken();
        const response = await fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5",
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        if (data.messages) {
            for (let msg of data.messages) {
                const msgResponse = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const msgData = await msgResponse.json();

                const headers = msgData.payload.headers;
                const subject = headers.find(h => h.name === "Subject")?.value;
                console.log("Email subject:", subject);
            }
        } else {
            console.log("No messages found.");
        }
    } catch (err) {
        console.error("Error fetching emails:", err);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("extention installed");
    fetchEmails();
});
