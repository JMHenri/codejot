import { RouterContext } from '../../deps.ts';

export const createCompletion = async (context: RouterContext) => {
  // Get the body from the context.
  const body = await context.request.body();

  // Check if the body is present and is of type JSON.
  if (body.type === "json") {
    // Get the prompt and other parameters from the body.
    const { prompt, temperature, maxTokens } = await body.value;
  
    // Use these parameters to call GPT-4.
    const response = await gpt4.createCompletion(prompt, {
      temperature: temperature,
      maxTokens: maxTokens
    });

    // Send the completion back as the response.
    context.response.body = response;
  } else {
    // Send an error response if the request body isn't JSON.
    context.response.status = 400;
    context.response.body = { error: "Expected JSON body." };
  }
};
