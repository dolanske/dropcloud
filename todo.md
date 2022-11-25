# Todo

## Design

- [Palette] [] Pick a new accent color
- [Palette] [] Mockup a quick dark-mode
- [Palette] [] Update neutral colors, possibly move away from tinted ones to grayscale?

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

- [Detail] [] 


--------------

# Day plan

- [x] Automatically pause when song finishes
- [x] Fix skipping backwards in player
- [x] Fix possibility of progress bar extending beyond 100%
- [x] Fix folder file count
