.PHONY: default
default:
	@echo Usage:
	@echo make gui - run SuperCollider IDE
	@echo make nvim - run a Neovim session
	@echo make vim - run a Vim session

.PHONY: gui
gui:
	scide main.scd

.PHONY: nvim
nvim:
	tmux new -s sc nvim main.scd

.PHONY: vim
vim:
	tmux new -s sc vim main.scd
