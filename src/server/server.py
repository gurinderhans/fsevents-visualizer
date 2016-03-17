import tornado.websocket
 
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

class MainHandler(tornado.web.RequestHandler):
	def get(self):
		self.render("../visualizer/index.html")
		
application = tornado.web.Application([
	(r"/socket", WebSocketHandler),
	(r"/", MainHandler),
	(r'/(.*)', tornado.web.StaticFileHandler, {"path": "../visualizer"}),
])

PORT=8888


if __name__ == "__main__":
	application.listen(PORT)
	print "Visit: http://localhost:{0} to view the tree".format(PORT)
	tornado.ioloop.IOLoop.instance().start()
