To resolve npm packages.

deno cache deps.ts


to ensure consistent calling:
double call and compare results
if results differ, double call again.

a great node library would be "llm-multi-sample-math" and "openai-multisample" or something.
the math lib would take in your prompt and your desired consistency for the output.
it would run the prompt 200 times and count up failures.

it would calculate the cheapest way to ensure the desired consistency.
in order to increase consistency, it will run parallel prompts and compare results, only returning results if all match.
consistency could be 100 for 'fails in in 100 times', or 100,000 for 'fails in 100,000 times'.

------
reach out to files,
send them to a unique prompt saying "you have been tasked with parsing this file, and pulling out
function X. Please also pull out any top level code that may affect function X such as a
CONST variable declaration"
then have it respond in api format, something very formatted


------
so master has the big prompt that asks for more files and functions.

then the server grabs the files, and sends them to the workers, the workers parse and return
the data is then ammended to the master prompt.

the workers need to be able to recurse until they find an actual function.

-------
the UID for a file is the path to the file
I will store parent/child connectors in the grpah so that I can navigate by ref.
the ai will have access to top level code.
the graphs may not be necessary - I could use an llm to pull out the function (especially turbo).


master prompt has top level code and the function -
asks for a file by path, and a function by name.

The FileParser is fed the file and is asked to provide the top level code and the function if it exists (it might be another import).

then it is fed into the master prompt
suppose the function exists - great
supposed its just another referenced import - that will work too, it will ask for another file by reference and a function by name.



---------
another way to grab refs is to pre-parse with an llm and store in a graphdb.
we store:
- top level code
- all variable definitions (functions or otherwise.)
but there are a lot of "turing complete" challenges to tackle here. I dont think it would work. (what if there is a class and its exported with a different name? confusing).
------------

I could give all my files nicknames so that the llm doesn't get confused.

I probably have to do resolution first and store all files with "fileresolved" paths.
-----------
needs to remember where each resolution goes to.
needs to know whats been resolved.

-----------------
we will add in multiple file types over time.

- project file - identified by path from ProjDir
- documentation file - ??
- web search results
- and so on and so on.


----------------------
will also need to add in vector search.



----------------
Basic vision:
- api endpoints
  - take a github repo name, scan, and upload to db
  - take a jira ticket, return comments.


----
basic vision for file retrieval and function retrieval:
- master prompt asks for a file import
- id love if they were just.... connected, somehow.
- but to connect em I can do it live or preload, I just have to do it right.
- To do it right. I have to crawl.