// import * as React from "react";
import React, { useState } from 'react';
import { NavLink } from "react-router-dom";
import { Link, Outlet } from "react-router-dom";
import { View, Button, Flex, ScrollView, Text } from "@aws-amplify/ui-react";
import { CreateChat } from "../components/CreateChat";
import { FiX, FiMenu } from "react-icons/fi";
import { Heading } from '@aws-amplify/ui-react';
import {
  ConversationsContext,
  ConversationsProvider,
} from "../components/ConversationsProvider";

export const Header = () => {


  const { conversations, deleteConversation } =
    React.useContext(ConversationsContext);

  return (
    <Flex direction="column" className="sidebar">
      <Heading level={5}>Chat History</Heading>
      <ScrollView flex="1">
        <Flex direction="column">
          {conversations.map((conversation) => (
            <Flex direction="row" key={conversation.id} alignItems="center" className="nav-separator">
              <Flex direction="column" flex="1">
                <Link to={`/chat/${conversation.id}`}>
                  {conversation.name ?? conversation.id}
                </Link>
                <Text>
                  {new Date(conversation.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      hour12: true,
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </Text>
              </Flex>
              <Button
                onClick={() => deleteConversation({ id: conversation.id })}
              >
                <FiX />
              </Button>
            </Flex>
          ))}
        </Flex>
      </ScrollView>
      <Flex direction="row" className="create-chat-container">
        <CreateChat />
      </Flex>
    </Flex>
  );
};

export const Chat = () => {
  
  const [isClassAdded, setIsClassAdded] = useState(true);
  const toggleClass = () => {
    setIsClassAdded(prevState => !prevState); // Toggle the boolean state
  };

  return (
    <ConversationsProvider>
      <Flex direction="row" flex="1" className={`main-container ${isClassAdded ? 'left-slide-open' : 'left-slide-close'}`}>
        <Button onClick={toggleClass} className='toggle-button'> 
          <FiMenu  />
        </Button>
        <Header />
        <View className="main-body">
        
          <Outlet />

          <Flex direction="row" className='footer'>

          <NavLink to="/chat">Chat</NavLink>
          <CreateChat />
          <NavLink to="/recipe-generator">Recipe generator</NavLink>
          </Flex>
        </View>
      </Flex>
    </ConversationsProvider>
  );
};
