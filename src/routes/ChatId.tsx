import * as React from "react";
import { useParams } from "react-router-dom";
import { client, useAIConversation } from "../client";
import { View, Button, Flex } from "@aws-amplify/ui-react";
import { AIConversation } from "@aws-amplify/ui-react-ai";
import { ConversationsContext } from "../components/ConversationsProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as pdfjsLib from 'pdfjs-dist';
import { UserPreferencesContext } from "../contexts/UserPreferencesContext";
import { getSeason, getCurrentMealTime, getMacrosByDiet } from '../utils/mealContextHelpers';
import { FiPaperclip, FiFile } from "react-icons/fi";

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

// Define types for message content
interface Attachment {
  type: string;
  url: string;
  name?: string;
}

// interface Location {
//   name: string;
//   lat: number;
//   lng: number;
// }

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

  const { preferences } = React.useContext(UserPreferencesContext);

  const handleImageUpload = async (file: File) => {
    if (file.type.startsWith('image/')) {
      sendMessage({
        content: [{
          type: 'attachment',
          attachment: file
        }]
      });
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `Page ${i}:\n${pageText}\n\n`;
        }
        
        sendMessage({
          content: [{
            type: 'text',
            text: fullText
          }]
        });
      } catch (error) {
        console.error('Error reading PDF:', error);
      }
    }
  };

  // Hidden file inputs
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <View>
      <AIConversation
        allowAttachments
        messages={messages}
        handleSendMessage={(message) => {
          sendMessage(message);
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
        onFileSelect={handleImageUpload}
        acceptedFileTypes={['image/*']}
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
                  {messageContent.attachments?.map((attachment: Attachment, idx: number) => (
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
        aiContext={() => ({
          userPreferences: preferences,
          currentSeason: getSeason(new Date()),
          localTime: new Date().toLocaleTimeString(),
          mealTime: getCurrentMealTime(), // breakfast/lunch/dinner based on time
          availableIngredients: [], // Could be connected to a pantry inventory
          previousMeals: [], // Track meal history
          nutritionalGoals: {
            dailyCalories: preferences.calorieTarget,
            macroDistribution: getMacrosByDiet(preferences.mealPlanType),
          }
        })}
        customInputArea={({ textArea, attachButton }) => (
          <Flex direction="row" alignItems="center" width="100%">
            {textArea}
            {attachButton}
            <input
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              ref={pdfInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePdfUpload(file);
                e.target.value = '';
              }}
            />
            <Button
              size="small"
              variation="link"
              onClick={() => pdfInputRef.current?.click()}
            >
              <FiFile size={18} />
            </Button>
          </Flex>
        )}
      />
    </View>
  );
};
