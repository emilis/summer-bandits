# Summer Bandits SuperCollider project

WIP.

## Setup

Should work smoothly on Debian based Linux distributions (Rasbperry Pi OS, Ubuntu).

```bash
sudo apt install make supercollider supercollider-ide
```

To configure the Jack server on Raspberry I had to create `$HOME/.jackdrc` file with such contents:

```
/usr/local/bin/jackd -P75 -p16 -dalsa -dhw:0 -r44100 -p1024 -n3
```

## Usage

Launch the SuperCollider IDE:

```
make gui
```

Launch Tmux+Vim session:

```
make vim
```

This should open `main.scd` in your editor of choice. The rest of the instructions are in the file.

## TODO

- [ ] Decide on goals and priorities
- [ ] Add Setup documentation

### General

- [x] Implement a way to handle multiple MIDI inputs.
- [ ] Manage sound clipping issues (use Mix?)
- [ ] Figure out how to hot-fix quarks
- [ ] Implement chord switcher
- [ ] Metronome Hi-hats
- [ ] Tempo switcher
    - [ ] implement swing
    - [ ] MIDI sync with external gear ?
- [ ] Auto-start on Raspberry boot

### Guitar

- [ ] Gather a list of samples
- [ ] Find and use some effects
- [ ] Implement arp with different modes

### Bass Guitar

- [ ] Find some suitable synths
- [ ] Find and use some effects
- [ ] Implement arp with different modes

### Drums

- [ ] Create a list of drumkits
- [ ] Decide on back-up drum machine
- [ ] A way to turn off the metronome and take tempo from the drummer?

### MIDI Keys

- [ ] Find some suitable synths
- [ ] Decide on MIDI controller and controls to switch chords, etc.
- [ ] Find and use some effects
- [ ] Implement MIDI chord player

### Horror box

- [ ] Find an effect which could apply it over all instruments

### Extras

#### Soundboard

- [ ] Gather sample list
- [ ] Use with Launchpad Mini
