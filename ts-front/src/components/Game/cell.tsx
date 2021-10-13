import React, { useEffect, useState } from 'react';

import {Button} from 'react-bootstrap';

import black_king from '../../images/black_king.png';
import black_queen from '../../images/black_queen.png';
import black_rook from '../../images/black_rook.png';
import black_knight from '../../images/black_knight.png';
import black_bishop from '../../images/black_bishop.png';
import black_pawn from '../../images/black_pawn.png';

import white_king from '../../images/white_king.png';
import white_queen from '../../images/white_queen.png';
import white_rook from '../../images/white_rook.png';
import white_knight from '../../images/white_knight.png';
import white_bishop from '../../images/white_bishop.png';
import white_pawn from '../../images/white_pawn.png';
import { isNonNullExpression } from 'typescript';

const black = [black_king, black_queen, black_rook, black_knight, black_bishop, black_pawn];
const white = [white_king, white_queen, white_rook, white_knight, white_bishop, white_pawn];

const Cell = ({ key, width, height, x, y }: any) => {
	const [object, setObject] = useState({
		name: 'empty',
		x: -1,
		y: -1,
		lived: true,
		image: '',
		type:'',
	});
	useEffect(() => {

		if (y === 0) {
			if (x === 4) setObject({ name: 'black_king', x: x, y: y, lived: true, image: black_king, type: 'black' });
			if (x === 3) setObject({ name: 'black_queen', x: x, y: y, lived: true, image: black_queen, type: 'black' });
			if (x === 2 || x === 5) setObject({ name: 'black_bishop', x: x, y: y, lived: true, image: black_bishop, type: 'black' });
			if (x === 1 || x === 6) setObject({ name: 'black_knight', x: x, y: y, lived: true, image: black_knight, type: 'black' });
			if (x === 0 || x === 7) setObject({ name: 'black_rook', x: x, y: y, lived: true, image: black_rook, type: 'black' });
		}
		if (y === 1) {
			setObject({ name: 'black_pawn', lived: true, x: x, y: y, image: black_pawn, type: 'black' });
		}

		if (y === 7) {
			if (x === 4) setObject({ name: 'white_king', x: x, y: y, lived: true, image: white_king, type: 'white' });
			if (x === 3) setObject({ name: 'white_queen', x: x, y: y, lived: true, image: white_queen, type: 'white' });
			if (x === 2 || x === 5) setObject({ name: 'white_bishop', x: x, y: y, lived: true, image: white_bishop, type: 'white' });
			if (x === 1 || x === 6) setObject({ name: 'white_knight', x: x, y: y, lived: true, image: white_knight, type: 'white' });
			if (x === 0 || x === 7) setObject({ name: 'white_rook', x: x, y: y, lived: true, image: white_rook, type: 'white' });
		}
		if (y === 6) {
			setObject({ name: 'white_pawn', lived: true, x: x, y: y, image: white_pawn, type: 'white' });
		}
	}, []);

	return (
		<div>
			{(x + y) % 2 === 0 ? <button style={{ width: width, height: height, backgroundColor: '#996600', border: 0}}>
				{(x === object.x && y === object.y && object.lived) &&
					<img src={object.image} style={{width: width - 10, height: height - 10 }} />
				}

			</button> :
				<button style={{ width: width, height: height, backgroundColor: '#ffcc66', border: 0 }}>
					{(x === object.x && y === object.y && object.lived) &&
						<img src={object.image} style={{width: width - 10, height: height - 10 }} />
					}
				</button>
			}
		</div>
	)
}

export default Cell;

