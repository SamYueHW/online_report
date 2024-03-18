import React, { useState, useEffect, useRef, createRef } from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import {default as QRCode } from 'qrcode.react';
import { useNavigate } from "react-router-dom";

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { useGetState } from 'ahooks';
import Adminsidebar from "../../components/sidebar/Adminsidebar";
import './qrOrderGenerator.scss';



const TableListEditor = ({ tables, setTables, iconUrl }) => {
  const addTable = () => setTables([...tables, '']);
  const removeTable = (index) => setTables(tables.filter((_, i) => i !== index));
  const updateTable = (index, value) => {
    const newTables = [...tables];
    newTables[index] = value;
    setTables(newTables);
  };

  return (
    <div className="table-list-container">
    <button type="button" className="add-table-btn" onClick={addTable}>Add Table</button>
      {tables.map((table, index) => (
        <div key={index} className="table-row">
          <input
            type="text"
            value={table}
            onChange={(e) => updateTable(index, e.target.value)}
          />
          <button type="button" onClick={() => removeTable(index)}>Remove</button>
        </div>
      ))}
     
    </div>
  );
};

const QrOrderGenerator = () => {
    const navigate = useNavigate();
    const [user, setUser, getUser] = useGetState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    const [tables, setTables] = useState(null);
    const [storeUrl, setStoreUrl] = useState(''); // 用于生成二维码的URL
    const [iconUrl, setIconUrl] = useState('');


    ///qr-order-generator/:storeID

    const { storeId } = useParams(); // 使用 useParams 钩子获取参数

    const canvasRef = useRef([]);
    useEffect(() => {
        // 当 tables 更新时，重新设置 ref 数组
        // 确保 tables 是非空的，否则使用空数组
        canvasRef.current = (tables || []).map((_, index) => canvasRef.current[index] || createRef());
    }, [tables]);


    const handleLogout = async () => {
        try {
          await axios.get(process.env.REACT_APP_SERVER_URL + '/logout', { withCredentials: true });
          sessionStorage.removeItem('jwtToken');
          navigate('/');
        } catch (error) {
          console.log(error);
        }
    };
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    useEffect(() => {
      // 在组件挂载时设置
      document.body.style.overflow = 'auto';  // 或者 'scroll'
  
      // 在组件卸载时还原
      return () => {
        document.body.style.overflow = 'hidden'; // 或者原来的值
      };
    }, []);   
    useEffect(() => {
        const fetchData = async () => {
          try {
            const token = sessionStorage.getItem('jwtToken');
            const config = {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            };
            
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/fetchTableNumber/${storeId}`, config);
            
            if (response.status === 200) {
                const tableNumbers = response.data.results.map(table => table.TableNo);
                
                // tableNumbers.push("take-away");
                if (tableNumbers.length > 0) {
                    setTables(tableNumbers);
                  
                    
                    setStoreUrl( response.data.storeUrl); // 用于生成二维码的URL
                }
                

            } else {
              alert("Error");
              navigate('/');
            }
          } catch (error) {
            // 可以在这里输出更具体的错误信息
            console.error("An error occurred while fetching data:", error);
            alert("Error");
            navigate('/');
          }
        };
        
           
            fetchData();
        
      }, [storeId]); // 确保依赖列表包含storeId
      

  const handleIconUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const downloadStringAsFile = (data, filename) => {
    const a = document.createElement("a");
    a.download = filename;
    a.href = data;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const downloadZip = async () => {
    const zip = new JSZip();
    const jpgPromises = tables.map(async (table) => {
        const svgElement = document.getElementById(`QRCode_${table}`);
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            // 设置合适的画布尺寸
            canvas.width = 300; // 示例尺寸，可根据需要调整
            canvas.height = 300;

            const imgPromise = new Promise((resolve) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const jpgData = canvas.toDataURL("image/jpeg");
                    zip.file(`QRCode_${table}.jpg`, jpgData.split(",")[1], { base64: true });
                    resolve();
                };
            });

            img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
            return imgPromise;
        }
    });

    await Promise.all(jpgPromises);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `QRCodes_${storeId}.zip`);
};



// useEffect(() => {
//     // 当 tables 更新时，重新设置 ref 数组
//     if (!tables) return;
//     console.log(canvasRef.current)
// }, [tables]); // 依赖于 tables 而不是 qrCodeRefs

return (
    <div>
        <Adminsidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <main className='store-setup'>
            <h1>QR Code Generator</h1>
            {tables && canvasRef ? (
                <>
                    <h2>Table List</h2>
                    <p>Store ID: {storeId}</p>
                    <TableListEditor tables={tables} setTables={setTables} />
                    <h4 style={{fontSize:'16px'}}>Store Logo:</h4>
                    <input type="file" onChange={handleIconUpload} />
                    <div className="table-list">
                        {tables.map((table, index) => {
                            const qrValue = `${process.env.REACT_APP_FONT_QR_URL}/${storeUrl}/${table}`;
                            const imageSettings = iconUrl ? {
                                src: iconUrl,
                                x: null,
                                y: null,
                                height: 30,
                                width: 30,
                                excavate: true,
                            } : null;

                            return (
                                <div key={index} className="table-container">
                                    <div ref={canvasRef.current[index]}>
                                    <QRCode 
                                        id={`QRCode_${table}`}
                                        value={qrValue}
                                        size={150}
                                        fgColor="#000000"
                                        style={{ margin: 'auto' }}
                                        imageSettings={imageSettings}
                                        renderAs={"svg"}
                                    />
                                    </div>  
                                    <div>
                                        {table === "take-away" ? <p>Take Away</p> : <p>Table {table}</p>}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                    <button type="button" className='add-table-btn' onClick={downloadZip}>Download QR Codes</button>
                </>
            ) : (
                <b style={{marginTop:"20px"}}>There is no table in this store. Please upload it.</b>
            )}
        </main>
    </div>
);
};
export default QrOrderGenerator;