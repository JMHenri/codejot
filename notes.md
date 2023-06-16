To resolve npm packages.

deno cache deps.ts


I think resolution of vars and functions is effectively impossible (although an llm could help)
there is the issue in that, what about top level code?

Going on a file by file basis, we can resolve references to other files.
The only issue in this case is context size.

If I run code thru a whitespace minifier. I think file by file should work for a few files.

or hash the function defs and store as unique funs.
decent idea

Or a file that is the entry point.
Then we can resolve all the imports and exports from that file.
Then we can resolve all the imports and exports from those files.
And then use llms to pull data.

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

