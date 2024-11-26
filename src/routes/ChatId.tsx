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
        text: ({ text }: { text: string }) => (
          <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
            {text}
          </ReactMarkdown>
        ),
        attachment: ({
          attachment,
        }: {
          attachment: { type: string; url: string; name?: string };
        }) => (
          <div className="attachment">
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
        ),
        location: ({
          location,
        }: {
          location: { name: string; lat: number; lng: number };
        }) => (
          <div className="location">
            <strong>Suggested Location:</strong>
            <p>{location.name}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Google Maps
            </a>
          </div>
        ),
      }}
    />
  );
};
