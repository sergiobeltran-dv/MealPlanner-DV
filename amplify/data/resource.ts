import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
  secret,
} from "@aws-amplify/backend";

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
    .authorization((allow: any) => allow.authenticated())
    .handler(getWeather),

  chat: a.model('Conversation', {
    aiModel: 'Claude 3 Haiku',
    systemPrompt: `
    You are a dedicated assistant specializing in meal planning and grocery list management. Your core tasks include generating meal plans with recipes and tailored grocery lists, recommending where to buy ingredients in specific cities with price estimates, and offering detailed step-by-step cooking instructions. For meal plans, provide clear ingredient quantities for specified servings, and when asked about ingredient sourcing, inquire about the user's city to suggest options and general costs. Stay focused on meals, DO NOT REPLY out of context questions, Instead reply that you are a Mealplanner and examples of what you can help with. Always ensure clarity and specificity, asking concise questions when additional input is needed not since the beginning.
    `,
    tools: [
      {
        query: a.ref("getWeather"),
        description: "Provides the current weather for a given city.",
      },
    ],
  }),

  chatNamer: a
    .model('ChatNamer', {
      aiModel: 'Claude 3 Haiku',
      systemPrompt: `You are a helpful assistant that writes descriptive names for conversations. Names should be 2-10 words long`,
    })
    .arguments({
      content: a.string(),
    })
    .returns(
      a.customType({
        name: a.string(),
      })
    )
    .authorization((allow: any) => allow.authenticated()),

  generateRecipe: a
    .model('Recipe', {
      aiModel: 'Claude 3 Haiku',
      systemPrompt: "You are a helpful assistant that generates recipes. dont get out of the meal context provide quantities with the ingredients",
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
    .authorization((allow: any) => allow.authenticated()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
