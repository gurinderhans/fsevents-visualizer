import tornado.web
import tornado.websocket
import tornado.ioloop

 
class WebSocketHandler(tornado.websocket.WebSocketHandler):
	conns=[]
	def open(self):
		print "New client connected"
		self.conns.append(self)

	def on_message(self, message):
		for con in self.conns:
			con.write_message(message)

	def on_close(self):
		self.conns.remove(self)
		print "Client disconnected"
	
	def check_origin(self, origin):
		return True


application = tornado.web.Application([
    (r"/", WebSocketHandler),
])
 
if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
