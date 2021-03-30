import express from 'express';
import server from '@api/server';

export default server(express(), process.env.HOST || '0.0.0.0', process.env.PORT || 3000);
