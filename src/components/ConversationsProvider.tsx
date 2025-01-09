import React from "react";
import { Schema } from "../../amplify/data/resource";
import { client } from "../client";
import { useNavigate } from "react-router-dom";

interface ConversationsContextType {
  conversations: Schema["chat"]["type"][];
  setConversations: React.Dispatch<
    React.SetStateAction<Schema["chat"]["type"][]>
  >;
  updateConversation: (
    conversation: Partial<Schema["chat"]["type"]> & { id: string }
  ) => void;
  createConversation: () => Promise<Schema["chat"]["type"] | undefined>;
  deleteConversation: (input: { id: string }) => void;
}

export const ConversationsContext =
  React.createContext<ConversationsContextType>({
    conversations: [],
    setConversations: () => {},
    updateConversation: () => {},
    createConversation: async () => {
      return new Promise((resolve) => resolve(undefined));
    },
    deleteConversation: () => {},
  });

export const ConversationsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = React.useState<
    Schema["chat"]["type"][]
  >([]);

  React.useEffect(() => {
    client.conversations.chat.list().then((res) => {
      if (res.data) {
        setConversations(
          res.data.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
        );
      }
    });
  }, []);

  const updateConversation: ConversationsContextType["updateConversation"] = (
    conversation
  ) => {
    client.conversations.chat.update(conversation).then((res) => {
      if (res.data) {
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === conversation.id);
          if (index !== -1) {
            prev[index] = res.data!;
            return [...prev];
          } else {
            return [res.data!, ...prev];
          }
        });
      }
    });
  };

  const deleteConversation = async ({ id }: { id: string }) => {
    const { data } = await client.conversations.chat.delete({ id });
    console.log({ data });

    setConversations((prev) => prev.filter((c) => c.id !== id));
    navigate('/chat');
  };

  const createConversation = async () => {
    const { data: conversation } = await client.conversations.chat.create({
      content: "Hello! I'm your meal planning assistant. I can help you with:\n" +
              "- Creating personalized meal plans\n" +
              "- Finding and sharing recipes with detailed cooking instructions\n" +
              "- Making grocery shopping lists\n" +
              "- Providing nutritional information and advice\n" +
              "- Offering cooking tips and techniques\n" +
              "How can I assist you with your meal planning today?",
      role: "assistant"
    });
    
    if (conversation) {
      setConversations((prev) => [conversation, ...prev]);
      const newChatUrl = `/chat/${conversation.id}`;
      if (window.location.pathname.startsWith('/chat/')) {
        window.location.href = newChatUrl;
      } else {
        navigate(newChatUrl, { replace: true });
      }
      return conversation;
    }
  };

  const value = {
    conversations,
    setConversations,
    updateConversation,
    createConversation,
    deleteConversation,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};
