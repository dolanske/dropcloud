# Notes & Todo

## Design

- [Palette] [] Pick a new accent color
- [Palette] [] Mockup a quick dark-mode
- [Palette] [] Update neutral colors, possibly move away from tinted ones to grayscale?
- [Loading] [] Add a global loading indicator. top of the page?

## Components

- [Player] []  Add history of played songs and implemet prev & next buttons to use it
- [Player] []  Add repeat (only current song) button (sets autoplay)
- [Player] []  After song finishes, automatically play the next song in line
  - [Shuffle] []  Implement shuffle, the next song is randomly picked (and check for history to avoid repeating)

- [Player] []  Add a fade in & out when pausing song, dont just cut to 100% or 0% volume volume
- [Player] []  Fix song progress either being 1 second shorter or 1 second longer when song ends. (possibly just auto set when song stops playing?)

--------------

## Tasks #3

- [x] Add Progress + length to bar vizualized
- [] Add link to the folder where song comes from

## Tasks #2 (26-27/11/2022)

- [] Add shuffle (should not play the same file if its within the last X songs)
- [] Implement previous and next file
  - next goes (random if on shuffle) or (next one in queue) or (next logical one in list)
