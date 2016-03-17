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
        
        let 😇 = WebSocket("ws://localhost:8888/socket")
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
            if let paths = (changedPaths as NSArray) as? [String] {
                var pathsDict = [[String: String]]()
                for path in paths {
                    do {
                        let attrs = try NSFileManager.defaultManager().attributesOfItemAtPath(path)
                        if let sz = attrs["NSFileSize"] as? Int {
                            var pdict = [String:String]()
                            pdict["path"] = path
                            pdict["size"] = String(sz)
                            pathsDict.append(pdict)
                        }
                    } catch _ {}
                }
                
                do {
                    let jsonData = try NSJSONSerialization.dataWithJSONObject(pathsDict, options: NSJSONWritingOptions.PrettyPrinted)
                    if let theJSONText = NSString(data: jsonData, encoding: NSASCIIStringEncoding) {
                        😇.send(theJSONText)
                    }
                } catch let error as NSError {
                    print(error)
                }
            }
        }
    }
}

