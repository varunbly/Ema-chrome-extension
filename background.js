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

function getBody(payload) {
    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === "text/html") {
                return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
            if (part.mimeType === "text/plain") {
                return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
            if (part.parts) { // nested parts
                const result = getBody(part);
                if (result) return result;
            }
        }
    } else if (payload.body && payload.body.data) {
        return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    return "";
}

async function fetchEmails() {
    try {
        const token = await getAuthToken();
        const response = await fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=in:inbox category:primary",
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        if (data.messages) {
            for (let msg of data.messages) {
                const msgResponse = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const msgData = await msgResponse.json();

                const headers = msgData.payload.headers;

                const subject = headers.find(h => h.name === "Subject")?.value || "";
                const from = headers.find(h => h.name === "From")?.value || "";
                const date = headers.find(h => h.name === "Date")?.value || "";

                const body = getBody(msgData.payload);

                console.log({
                    subject,
                    from,
                    date,
                    body
                });
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
    chrome.alarms.create("fetchEmails", { periodInMinutes: 1});
    fetchEmails();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "fetchEmails") fetchEmails();
});
