import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
  secret,
} from "@aws-amplify/backend";
// import { customConversationHandlerFunction } from "../functions/conversation-handler/resource";

export const getWeather = defineFunction({
  name: "getWeather",
  entry: "./getWeather.ts",
  environment: {
    WEATHERSTACK_API_KEY: secret("WEATHERSTACK_API_KEY"),
  },
});
const schema = a.schema({
  Temperature: a.customType({
    value: a.integer(),
    unit: a.string(),
  }),

  getWeather: a
    .query()
    .arguments({ city: a.string() })
    .returns(a.ref("Temperature"))
    .authorization((allow) => allow.authenticated())
    .handler(a.handler.function(getWeather)),

  chat: a.conversation({
    aiModel: a.ai.model("Claude 3 Haiku"),
    systemPrompt: `
    You are a helpful assistant focused on meal planning and grocery list management.
    Your primary tasks are:
      1. Generating meal plans, recipes, and grocery lists.
      2. Providing recommendations on where to buy ingredients in specific cities and estimating prices.
      3. Offering step-by-step instructions for meal preparation.

    Guidelines:
    - If a user requests a meal plan, provide a list of meals or recipes for a number of servings with clear quantities of ingredients.
    - If a user asks about where to buy ingredients, ask for their city and provide general price estimates based on typical market costs.
    - When asked for recipe details, start by listing ingredients with their quantities for the specified number of servings, then proceed to detailed step-by-step instructions.
    - Do not apologize for lacking specific knowledge. Instead, provide responses based on general knowledge directly.
    - If the user’s query is outside your scope, explain your capabilities and suggest tasks you can perform, such as:
        - "Generate a grocery list for a meal plan."
        - "Provide recipes with quantities for specific servings."
        - "Suggest where to buy ingredients in a city."
    - Stay strictly within the context of meals.
    - Provide ingredients with quantities tailored to the specified number of servings.
    - Follow with clear, step-by-step instructions for preparation.
    - Avoid apologizing for general responses. Instead, provide practical and helpful suggestions.
    - Ask for additional input if necessary, such as the number of servings or dietary preferences.
    Interaction Rules:
    - If more input is needed from the user, such as their location or the number of servings, ask specific, concise questions to gather that information.
    - Stay focused on meal planning and grocery-related queries. Politely redirect users back to relevant tasks if they ask unrelated questions.
    `,
    tools: [
      {
        query: a.ref("getWeather"),
        description: "Provides the current weather for a given city.",
      },
    ],
  }),

  chatNamer: a
    .generation({
      aiModel: a.ai.model("Claude 3 Haiku"),
      systemPrompt: `
      You are a helpful assistant that writes descriptive names for conversations.
      Names should reflect the content of the chat and be 2-10 words long.
      `,
    })
    .arguments({
      content: a.string(),
    })
    .returns(
      a.customType({
        name: a.string(),
      })
    )
    .authorization((allow) => [allow.authenticated()]),

  generateRecipe: a
    .generation({
      aiModel: a.ai.model("Claude 3 Haiku"),
      systemPrompt: `
      You are a meal planning assistant that generates recipes. 
      Guidelines:
      - Stay strictly within the context of meals.
      - Provide ingredients with quantities tailored to the specified number of servings.
      - Follow with clear, step-by-step instructions for preparation.
      - Avoid apologizing for general responses. Instead, provide practical and helpful suggestions.
      - Ask for additional input if necessary, such as the number of servings or dietary preferences.
      `,
    })
    .arguments({
      description: a.string(),
    })
    .returns(
      a.customType({
        name: a.string(),
        ingredients: a.string().array(),
        instructions: a.string(),
      })
    )
    .authorization((allow) => allow.authenticated()),
});
