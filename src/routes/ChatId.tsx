import * as React from "react";
import { useParams } from "react-router-dom";
import { client, useAIConversation } from "../client";
import { AIConversation } from "@aws-amplify/ui-react-ai";
import { ConversationsContext } from "../components/ConversationsProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ChatIdPage = () => {
  const params = useParams();
  const { updateConversation } = React.useContext(ConversationsContext);
  const id = params.chatId ?? "";
  const [
    {
      data: { messages, conversation },
      isLoading,
    },
    sendMessage,
  ] = useAIConversation("chat", {
    id,
  });

  return (
    <AIConversation
      allowAttachments
      messages={messages}
      handleSendMessage={(message) => {
        sendMessage(message);

        // Generate a name for the conversation (only for the first message)
        if (!conversation?.name) {
          client.generations
            .chatNamer({
              content: message.content.map((c) => c.text ?? "").join(""),
            })
            .then((res) => {
              updateConversation({
                id,
                name: res.data?.name ?? "",
              });
            });
        }
      }}
      isLoading={isLoading}
      messageRenderer={{
        text: ({ text }) => {
          try {
            // Parse JSON content to extract rich data (attachments, locations, etc.)
            const messageContent = JSON.parse(text);

            return (
              <div>
                {/* Render Markdown if present */}
                {messageContent.markdown && (
                  <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
                    {messageContent.markdown}
                  </ReactMarkdown>
                )}

                {/* Render Attachments */}
                {messageContent.attachments?.map((attachment, idx) => (
                  <div className="attachment" key={idx}>
                    {attachment.type === "image" ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name ?? "Attachment"}
                        style={{ maxWidth: "100%", borderRadius: "8px" }}
                      />
                    ) : (
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        {attachment.name ?? "Download Attachment"}
                      </a>
                    )}
                  </div>
                ))}

                {/* Render Locations */}
                {messageContent.location && (
                  <div className="location">
                    <strong>Suggested Location:</strong>
                    <p>{messageContent.location.name}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${messageContent.location.lat},${messageContent.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            );
          } catch (err) {
            // If the message is not JSON, render as plain Markdown
            return (
              <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
                {text}
              </ReactMarkdown>
            );
          }
        },
      }}
    />
  );
};
