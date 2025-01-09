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

  chat: a.model({
    name: 'Conversation',
    fields: {
      aiModel: a.string(),
      systemPrompt: a.string(),
      tools: a.list(
        a.object({
          query: a.ref("getWeather"),
          description: a.string(),
        })
      ),
    }
  }),

  chatNamer: a.model({
    name: 'ChatNamer',
    fields: {
      aiModel: a.string(),
      systemPrompt: a.string(),
      content: a.string(),
      name: a.string(),
    }
  }),

  generateRecipe: a.model({
    name: 'Recipe',
    fields: {
      aiModel: a.string(),
      systemPrompt: a.string(),
      description: a.string(),
      name: a.string(),
      ingredients: a.list(a.string()),
      instructions: a.string(),
    }
  }),
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
