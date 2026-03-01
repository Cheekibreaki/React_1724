## Q1: Before coding, what did you think would be the hardest part?

The relationship between paper and authors will be the hardestpart.  In assignment1, authors were simply stored as a string field on the paper — no relational complexity at all.
But a2 needs to take consideration of the joined table, which is essential in writing findOrCreateAuthor, creatPaper and deleteAuthor. Besides, only author constraint on deleteAuthor required careful thought. Needs to get a list of all the papers before deleting  its cooresponding author to check if any paper would be left without an author.


## Q2: Did you use AI?

Yes 
 
## Q3: (Only if you used AI) Choose one AI-generated output and explain what you changed and why.

routes.ts is handled by AI, it's basically 2 lines of code assigning router to paper/author based off the route