import * as React from 'react';
import { MutableRefObject, useRef } from 'react';
import {TextField, Button, InputAdornment} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

type Props = {
    
};
const InputFile = (props: Props) => {
    const fileRef = useRef() as MutableRefObject<HTMLInputElement>;


    return (
        <div>
            <input type="file" hidden={true} ref={fileRef}/>
            <TextField 
              variant={'outlined'}
              InputProps={{
                  readOnly: true,
                  endAdornment: (
                      <InputAdornment position={'end'}>
                      <Button
                        endIcon={<CloudUploadIcon/>}
                        variant={'contained'}
                        color={'primary'}
                        onClick={() => fileRef.current.click()}
                      >
                          Adicionar
                      </Button>
                      </InputAdornment>
                  )
              }}
            />
        </div>
    );
};

export default InputFile;