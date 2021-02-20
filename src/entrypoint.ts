import server from '@api/server';
import express from 'express';

export default server(express(), process.env.HOST || '0.0.0.0', process.env.PORT || 3000);
