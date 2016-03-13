//
//  ViewController.swift
//  FSEventsDetector
//
//  Created by Gurinder Hans on 3/9/16.
//  Copyright © 2016 Gurinder Hans. All rights reserved.
//

import Cocoa
import SwiftFSWatcher
import SwiftWebSocket

class ViewController: NSViewController {


    override func viewDidLoad() {
        super.viewDidLoad()
        
        let 😇 = WebSocket("ws://localhost:8888")
        😇.event.open = {
            print("opened")
        }
        😇.event.close = { code, reason, clean in
            print("close")
        }
        😇.event.error = { error in
            print("error \(error)")
        }
        😇.event.message = { message in
        }
        
        let 😎 = SwiftFSWatcher.createWatcher()
        😎.paths = ["/"]
        😎.watch()
        😎.onFileChange = {numEvents, changedPaths in
            😇.send(changedPaths)
        }
    }

}

