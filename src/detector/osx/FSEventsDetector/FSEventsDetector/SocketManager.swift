//
//  SocketManager.swift
//  FSEventsDetector
//
//  Created by Gurinder Hans on 3/16/16.
//  Copyright © 2016 Gurinder Hans. All rights reserved.
//

import Foundation
import SwiftWebSocket

class SocketManager: NSObject {
    
    private var 😇: WebSocket!
    
    init(initWithUrl url: String, port: Int) {
        super.init()
        
        😇 = WebSocket("ws://\(url):\(port)/socket")
        😇.close()
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
    }
    
    func closeSocket() {
        😇.close()
    }
    
    func openSocket() {
        😇.open()
    }
    
    func sendData(data: String) {
        😇.send(text: data)
    }
}