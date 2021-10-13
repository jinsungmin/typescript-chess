import React, { useEffect, useState } from 'react';

import {
	Button,
	Image,
} from "react-bootstrap";

import black_queen from '../../images/black_queen.png';
import black_rook from '../../images/black_rook.png';
import black_knight from '../../images/black_knight.png';
import black_bishop from '../../images/black_bishop.png';

import white_queen from '../../images/white_queen.png';
import white_rook from '../../images/white_rook.png';
import white_knight from '../../images/white_knight.png';
import white_bishop from '../../images/white_bishop.png';

const CELL_SIZE = 60;
const BOARD_SIZE = 8;

let blackObjects = [
	{ image: black_queen, name: 'queen' },
	{ image: black_rook, name: 'rook' },
	{ image: black_knight, name: 'knight' },
	{ image: black_bishop, name: 'bishop' }
];
let whiteObjects = [
	{ image: white_queen, name: 'queen' },
	{ image: white_rook, name: 'rook' },
	{ image: white_knight, name: 'knight' },
	{ image: white_bishop, name: 'bishop' }
];

const Promotion = (props: any) => {

	const [object, setObject] = useState();

	const selectObject = (object: any) => {
		setObject(object);

		//props.selectPromotion(object);
	}

	const onSubmit = () => {
		if(object) {
			props.selectPromotion(object);
		}
	}

	return (
		<div>
			{props.color === 'black' && <div>
				{blackObjects.map((element: any) => {
					return <button onClick={() => selectObject(element)} style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: '#dddddd', border: '1px solid black' }}>
						<Image src={element.image} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px' }} />
					</button>
				})}
				<div>
					<Button onClick={() => onSubmit()} variant="dark" style={{width: '3rem', height:'2rem', marginTop: '1rem', textAlign: 'center', padding: '0rem'}}>승급</Button>
				</div>
			</div>}
			{props.color === 'white' && <div>
				{whiteObjects.map((element: any) => {
					return <button onClick={() => selectObject(element)} style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: '#dddddd', border: '1px solid black' }}>
						<Image src={element.image} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px' }} />
					</button>
				})}
				<div>
					<Button onClick={() => onSubmit()} variant="dark" style={{width: '3rem', height:'2rem', marginTop: '1rem', textAlign: 'center', padding: '0rem'}}>승급</Button>
				</div>
			</div>}

		</div>
	)
}

export default Promotion;