.PHONY: default
default:
	tmux new -s sc nvim main.scd


.PHONY: gui
gui:
	scide main.scd
