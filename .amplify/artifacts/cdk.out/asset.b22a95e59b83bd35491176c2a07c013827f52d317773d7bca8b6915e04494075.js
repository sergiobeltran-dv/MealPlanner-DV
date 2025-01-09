import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { args, request } = ctx;
  const { graphqlApiEndpoint } = ctx.stash;

  const selectionSet = 'associatedUserMessageId contentBlockDeltaIndex contentBlockDoneAtIndex contentBlockIndex contentBlockText contentBlockToolUse { toolUseId name input } conversationId id stopReason owner errors { errorType message }';

  const streamingResponseMutation = {
    name: 'createAssistantResponseStreamChat',
    inputTypeName: 'CreateConversationMessageChatAssistantStreamingInput',
    selectionSet,
  };

  const currentMessageId = ctx.stash.defaultValues.id;

  const modelConfiguration = {
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    systemPrompt: "\n    You are a dedicated assistant specializing in meal planning and grocery list management. Your core tasks include generating meal plans with recipes and tailored grocery lists, recommending where to buy ingredients in specific cities with price estimates, and offering detailed step-by-step cooking instructions. For meal plans, provide clear ingredient quantities for specified servings, and when asked about ingredient sourcing, inquire about the user's city to suggest options and general costs. Stay focused on meals, DO NOT REPLY out of context questions, Instead reply that you are a Mealplanner and examples of what you can help with. Always ensure clarity and specificity, asking concise questions when additional input is needed not since the beginning.\n    ",
    inferenceConfiguration: undefined,
  };

  const clientTools = args.toolConfiguration?.tools?.map((tool) => {
    return { ...tool.toolSpec };
  });
  const dataTools = [{"name":"getWeather","description":"Provides the current weather for a given city.","inputSchema":{"json":{"type":"object","properties":{"city":{"type":"string","description":"A UTF-8 character sequence."}},"required":[]}},"graphqlRequestInputDescriptor":{"selectionSet":"value unit","propertyTypes":{"city":"String"},"queryName":"getWeather"}}];
  const toolsConfiguration = { dataTools, clientTools };

  const messageHistoryQuery = {
    getQueryName: 'getConversationMessageChat',
    getQueryInputTypeName: 'ID',
    listQueryName: 'listConversationMessageChats',
    listQueryInputTypeName: 'ModelConversationMessageChatFilterInput',
    listQueryLimit: undefined,
  };

  const authHeader = request.headers['authorization'];
  const payload = {
    conversationId: args.conversationId,
    currentMessageId,
    responseMutation: streamingResponseMutation,
    graphqlApiEndpoint,
    modelConfiguration,
    request: { headers: { authorization: authHeader } },
    messageHistoryQuery,
    toolsConfiguration,
    streamResponse: true,
  };

  return {
    operation: 'Invoke',
    payload,
    invocationType: 'Event',
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.appendError(ctx.error.message, ctx.error.type);
  }
  const response = {
    __typename: 'ConversationMessageChat',
    id: ctx.stash.defaultValues.id,
    conversationId: ctx.args.conversationId,
    role: 'user',
    content: ctx.args.content,
    aiContext: ctx.args.aiContext,
    toolConfiguration: ctx.args.toolConfiguration,
    createdAt: ctx.stash.defaultValues.createdAt,
    updatedAt: ctx.stash.defaultValues.updatedAt,
  };
  return response;
}
