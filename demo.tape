# VHS tape file for opencode-await demo
# Install VHS: brew install charmbracelet/tap/vhs
# Run: vhs demo.tape

Output demo.gif

Set FontSize 14
Set Width 1200
Set Height 600
Set Theme "Dracula"
Set Padding 20

# Title
Type "# opencode-await - Demo"
Enter
Sleep 1s

# Show the tool in action
Type "# Using await_command with poll mode"
Enter
Sleep 500ms

Type "echo 'Starting long-running build...'"
Enter
Sleep 1s

Type "# The await_command tool monitors until pattern matches"
Enter
Sleep 500ms

Type "# Features: polling, log capture, AI summarization"
Enter
Sleep 1s

Type "echo 'Build complete!'"
Enter
Sleep 1s

# End
Type "# Install: Add 'opencode-await' to opencode.json plugin array"
Enter
Sleep 2s