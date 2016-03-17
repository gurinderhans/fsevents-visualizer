//
//  AppDelegate.swift
//  FSEventsDetector
//
//  Created by Gurinder Hans on 3/16/16.
//  Copyright © 2016 Gurinder Hans. All rights reserved.
//

import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

    @IBOutlet weak var window: NSWindow!

    @IBOutlet weak var statusMenu: NSMenu!

    let statusItem = NSStatusBar.systemStatusBar().statusItemWithLength(-1)
    
    let socketManager: SocketManager = SocketManager(initWithUrl: "localhost", port: 8888)
    let fsManager: FileEventsDetector = FileEventsDetector()
    
    func applicationDidFinishLaunching(aNotification: NSNotification) {
        let icon = NSImage(named: "menu-icon")
        icon?.template = true
        
        statusItem.image = icon
        statusItem.menu = statusMenu
        
        fsManager.watch(withPath: "/") { (numEvents, changedPaths) -> Void in
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
                    if let theJSONText = NSString(data: jsonData, encoding: NSASCIIStringEncoding) as? String {
                        self.socketManager.sendData(theJSONText)
                    }
                } catch let error as NSError {
                    print(error)
                }
            }
        }
    }

    var connected: Bool = false
    @IBOutlet weak var connectionStatus: NSMenuItem!
    @IBAction func connectDisconnectAction(sender: NSMenuItem) {
        connected = !connected
        if connected == true {
            socketManager.openSocket()
            sender.setTitleWithMnemonic("Disconnect")
            connectionStatus.setTitleWithMnemonic("Status: Connected")
        } else {
            socketManager.closeSocket()
            sender.setTitleWithMnemonic("Connect")
            connectionStatus.setTitleWithMnemonic("Status: Disconnected")
        }
    }
}

