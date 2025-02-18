"use client";
import * as React from "react";
import { NavLink } from "react-router-dom";
import Markdown from "react-markdown";
import {
  Button,
  Flex,
  Heading,
  Loader,
  ScrollView,
  Text,
  TextAreaField,
  View,
} from "@aws-amplify/ui-react";

import { useAIGeneration } from "../client";

interface RecipeData {
  name?: string;
  ingredients?: string[];
  instructions?: string;
}

export function RecipeGenerator() {
  const [description, setDescription] = React.useState("");
  const [{ data, isLoading }, generateRecipe] = useAIGeneration("generateRecipe");

  const handleClick = () => {
    generateRecipe({ description });
  };

  const recipeData = data as RecipeData;
  
  return (
    <Flex direction="column" flex="1" className="recipe-page">
      <Flex direction="row" padding="small">
        <Flex className="recipeGenerator-search">
          <TextAreaField
            autoResize
            flex="1"
            rows={1}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            label="Description"
            labelHidden
          />
          <Button onClick={handleClick}>Generate recipe</Button>
        </Flex>
      </Flex>
      {isLoading ? (
        <Loader variation="linear" />
      ) : (
        <>
          <ScrollView padding="large">
            <Heading level={2}>{recipeData.name}</Heading>

            <View as="ul">
              {recipeData.ingredients?.map((ingredient: string) => (
                <Text as="li" key={ingredient}>
                  {ingredient}
                </Text>
              ))}
            </View>
            <View color="font.primary">
              <Markdown>{recipeData.instructions}</Markdown>
            </View>
          </ScrollView>
        </>
      )}

      <Flex direction="row" className='footer'>

      <NavLink to="/chat">Chat</NavLink>
     
      </Flex>
    </Flex>


  );
}
