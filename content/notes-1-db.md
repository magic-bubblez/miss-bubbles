---
title: "[notes-db] logs and indices in DB"
date: 2026-11-10
category: notes
---

The simplest and fastest way to write data is an *append-only log*, however reading from a plain log means scanning entire files making the reads unacceptably slow. So we always need an index to make the reads faster and efficient. But any index slows down the writes since nothing is faster than simply appending to the end of a file. That's why one is forced to make a tradeoff between read and write performance. 

Hash map is the simplest form of an index and after that we've Sorted Strings Table which keeps the disk data sorted.

#### How is writing in SSTable implemented? 

- data is written into an in memory tree data structure (also called **memtable**) and when its size grows to some megabytes, we transfer the content of the memtable into a **segment file** on disk with keys sorted. it's efficient because the keys are already sorted when we write them to the memtable and we simply transfer them into the segment file that goes through merging and compaction. 

- whenever one wants to read the data, first we search for that in memtable, then go on inside the newest segment, older segment etc. 

- the one risk with this indexing method is, if power goes off memtable will be destroyed and the most recent writes can be wiped out. a solution is to put an append-only log in the disk that writes same data being written to the memtable. when we deplenish our memtable after it grows to a certain size into segment files, we destroy that append-only log and create a fresh one for the new memtable. 

*This whole process describes what an **Log-Structured Merge-tree (LSM-tree)** is*. Some terms to remember: 

- **WAL**: write-ahead log; the append-only log in the disk.
- **memtable**: in-memory tree data structure (usually implemented as AVL, Red-Black tree etc. (only balanced trees))
- **SSTable**: sorted string table; on disk segment files that hold the data. 
- **Compaction**: The process of merging segment files while removing duplicated keys. 


ref: *DDIA chapter 3*