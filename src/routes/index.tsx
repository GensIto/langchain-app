import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
// import { CloudflareWorkersAI } from "@langchain/cloudflare";
// import { env } from "cloudflare:workers";

const getCurrentServerTime = createServerFn({
  method: "GET",
}).handler(async () => {
  // const llm = new CloudflareWorkersAI({
  //   model: "@cf/meta/llama-3.1-8b-instruct",
  //   cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
  //   cloudflareApiToken: env.CLOUDFLARE_AI_TOKEN,
  // });

  // const inputText = "Cloudflare is an AI company that ";

  // const response = await llm.invoke(inputText);
  // return response;
  return "Hello, world!";
});

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => await getCurrentServerTime(),
});

function App() {
  const response = Route.useLoaderData();

  console.log("LLM Response:", response);

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
      <section className='relative py-20 px-6 text-center overflow-hidden h-lvh'>
        <p className='text-2xl md:text-3xl text-gray-300 mb-4 font-light'>
          The framework for next generation AI applications
        </p>
        <p className='text-2xl md:text-3xl text-gray-300 mb-4 font-light'>
          {response}
        </p>
        <Link to='/signup'>
          <Button>Sign up</Button>
        </Link>
        <Link to='/signin'>
          <Button>Sign in</Button>
        </Link>
      </section>
    </div>
  );
}
