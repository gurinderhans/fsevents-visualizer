//
//  FileEventsDetector.swift
//  FSEventsDetector
//
//  Created by Gurinder Hans on 3/16/16.
//  Copyright © 2016 Gurinder Hans. All rights reserved.
//

import Foundation
import SwiftFSWatcher

class FileEventsDetector: NSObject {
    
    private var 😎: SwiftFSWatcher!
    
    override init() {
        super.init()
        😎 = SwiftFSWatcher.createWatcher()
    }
    
    func watch(withPath path: String, cb: ((Int, NSMutableArray!) -> Void)!) {
        😎.paths = [path]
        😎.watch()
        
        😎.onFileChange = cb
    }
}