# Notes & Todo

## Design

- [Palette] [] Pick a new accent color
- [Palette] [] Mockup a quick dark-mode
- [Palette] [] Update neutral colors, possibly move away from tinted ones to grayscale?
- [Loading] [] Add a global loading indicator. top of the page?

## Components

- [Player] [x]  Reset activeAudio state when changing songs
- [Player] []  Add history of played songs and implemet prev & next buttons to use it
- [Player] []  Add repeat (only current song) button (sets autoplay)
- [Player] [x]  Implement volume changing
- [Player] []  After song finishes, automatically play the next song in line
  - [Shuffle] []  Implement shuffle, the next song is randomly picked (and check for history to avoid repeating)

- [Player] []  Add a fade in & out when pausing song, dont just cut to 100% or 0% volume volume
- [Player] []  Fix song progress either being 1 second shorter or 1 second longer when song ends. (possibly just auto set when song stops playing?)

- [Breadcrumbs] []  Implement breadcrumbs

- [List] []  Add proper highlight of which song is being played right now (possibly highlight in the folder structure too?)
  - [] Add animated icon in the table
  - [] Add animated icon to the file list?



--------------

## Tasks #1 (25/11/2022)

- [x] Automatically pause when song finishes
- [x] Fix skipping backwards in player
- [x] Fix possibility of progress bar extending beyond 100%
- [x] Fix folder file count
- [x] If progress is updated while paused, it ignores it and resumes where it ended

## Tasks #2 (25/11/2022)

- [x] Create a history registry
- [x] Cache downloaded files

- [] Add shuffle (should not play the same file if its within the last X songs)
- [] Implement previous and next file
  - next goes (random if on shuffle) or (next one in queue) or (next logical one in list)
- [] Create queue
- [] Implement repeating of the currently active song


## Tasks #3 

- [Folder] [] Stop using container and spread table to the rest of the view
  - [] Remove breadcrumbs infinite :before
  - [] Remove sidebar-navigation infinite :before
  - [] Add list of all files in current folder to the top right of the page 