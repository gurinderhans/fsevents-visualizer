# fsevents-visualizer

 **LUMEMETHOD**
 
 This software captures and visually displays any changed events occured on the hard disk.
 - The image consists of circles and lines.
   - Each circle represents a file or a folder
   - Each line represents a path of those files or folders.
   
 - Changes on the hard disk are:
   1. Adding: 
      - When a new file is added on the hard disk, the program detects the added file and adds a new node to the graph.
   2. Remove:
      - When a file is removed from the hard disk, it removes the node from image.
   3. Update:
      - Any updates on the files, the color of the circle changes.

# Demo 
<img src="demo.gif" alt="1" width=1000>


# How to Run (macOS only)
- `cd` into `src/server` and run the server.py (You'll most likely need to install the deps in `reqs.txt`)
  - And `python server.py`
- Run the OSX app from `src/detector/osx/exported` OR `build` your own if you don't trust mines 🙃
  - Once the OSX app is running, you should see it in the status bar as an opaque dot *(osx didn't like my selected icon)*
  - Making sure the server.py is running, click `Connect` to connect the OSX app to the WebSocket server
- With the above steps executed properly, cross your fingers and visit `http://localhost:8888`
- Cast the window onto the TV or another separate screen and work on stuff and enjoy the tree growing to life.
