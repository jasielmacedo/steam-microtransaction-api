import server from '@api/server'
import express from 'express'

server({
    app : express(),
    host : process.env.HOST || "0.0.0.0",
    port : process.env.PORT || 3000
})